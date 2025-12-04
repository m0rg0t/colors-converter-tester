# Потоковая загрузка и архивация ZIP-файлов

## Проблема

При использовании `responseType: "arraybuffer"` в axios весь файл загружается в память перед записью. При обработке 2000 файлов это приводит к переполнению памяти в GCP Functions.

```javascript
// ❌ Проблемный код — весь файл в RAM
await axios.get(url, { responseType: "arraybuffer" })
  .then(response => fs.writeFile(..., response.data))
```

## Решение — потоковая загрузка напрямую в архив

Данные проходят "транзитом" через буфер ~64KB, никогда не накапливаясь в памяти целиком.

### Схема потока данных

```
HTTP Response     archiver буфер     Файл на диске
     │                  │                  │
     ▼                  ▼                  ▼
┌─────────┐        ┌────────┐        ┌──────────┐
│ chunk   │───────▶│████    │───────▶│          │
│ chunk   │───────▶│████    │───────▶│ output   │
│ chunk   │───────▶│████    │───────▶│ .zip     │
│ ...     │        │        │        │          │
└─────────┘        └────────┘        └──────────┘
   64KB              64KB             Растёт на
                                       диске

Память: ~128KB константно (независимо от размера файлов)
```

### Код решения

```javascript
const archiver = require('archiver');
const axios = require('axios');
const fs = require('fs');
const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

async function downloadAndArchive(urls, fileNames, outputPath) {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { store: true }); // store — без пережатия

  archive.pipe(output);

  // Обработка ошибок архиватора
  archive.on('warning', (err) => {
    if (err.code !== 'ENOENT') throw err;
  });

  archive.on('error', (err) => {
    throw err;
  });

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const fileName = sanitizeFileName(fileNames[i] || `${i}.zip`);

    logger.log(`downloading ${i + 1}/${urls.length}: ${url}`);

    const response = await axios.get(encodeURI(url), {
      responseType: 'stream',  // ← Ключевое изменение!
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.90 Safari/537.36'
      },
      httpAgent,
      httpsAgent,
    });

    // Стримим прямо в архив!
    archive.append(response.data, { name: fileName });

    // Ждём пока этот файл запишется перед следующим
    await new Promise((resolve, reject) => {
      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  }

  await archive.finalize();

  // Ждём завершения записи на диск
  return new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });
}
```

## Ключевые моменты

### 1. `responseType: 'stream'` вместо `'arraybuffer'`
- Axios возвращает readable stream вместо буфера
- Данные читаются чанками по ~64KB

### 2. `store: true` в archiver
- Отключает сжатие при добавлении в архив
- ZIP-файлы уже сжаты, повторное сжатие бессмысленно и тратит CPU

### 3. Последовательная обработка
- `archiver` не поддерживает параллельные `append()` в один архив
- Ждём завершения записи каждого файла перед следующим

### 4. Ожидание `'end'` события
- Гарантирует что файл полностью записан перед переходом к следующему
- Без этого возможны race conditions

## Сравнение потребления памяти

| Подход | Память на файл | 2000 файлов по 10MB |
|--------|----------------|---------------------|
| `arraybuffer` | Весь файл | До 20GB (падает) |
| `stream` | ~64KB буфер | ~128KB константно |

## Ограничения для GCP Functions

- `/tmp` директория ограничена **10GB** (gen2) или **512MB** (gen1)
- Если финальный архив больше — нужно стримить в Cloud Storage
- Таймаут функции: до 9 минут (gen1) или 60 минут (gen2)

## Дополнительно: стриминг в Cloud Storage

Если архив не помещается в `/tmp`:

```javascript
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const bucket = storage.bucket('my-bucket');
const file = bucket.file('output.zip');
const output = file.createWriteStream();

archive.pipe(output);
// ... остальной код такой же
```

## Зависимости

```json
{
  "dependencies": {
    "archiver": "^6.0.0",
    "axios": "^1.6.0"
  }
}
```
