// ICC Profile configurations
export const ICC_PROFILES = [
  {
    key: 'generic',
    path: './profiles/GenericCMYK.icc',
    title: 'Generic CMYK',
    url: 'https://www.littlecms.com/',
    badge: 'ICC Profile',
    getDescription: (t) => t.genericDesc,
  },
  {
    key: 'fogra39',
    path: './profiles/FOGRA39.icc',
    title: 'FOGRA39',
    url: 'https://www.eci.org/',
    badge: 'ICC Profile',
    getDescription: (t) => t.fogra39Desc,
  },
  {
    key: 'gracol',
    path: './profiles/GRACoL2013_CRPC6.icc',
    title: 'GRACoL 2013',
    url: 'https://www.idealliance.org/',
    badge: 'ICC Profile',
    getDescription: (t) => t.gracolDesc,
  },
  {
    key: 'swop',
    path: './profiles/SWOP2013C3_CRPC5.icc',
    title: 'SWOP 2013',
    url: 'https://www.idealliance.org/',
    badge: 'ICC Profile',
    getDescription: (t) => t.swopDesc,
  },
]
