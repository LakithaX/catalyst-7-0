export interface PartnershipContact {
  id: string;
  name: string;
  role: string;
  email: string;
  /** International format, e.g. +94762077417 */
  phone: string;
  /** Only set this if the WhatsApp number is different from the phone number */
  whatsapp?: string;
  /** Portrait (transparent cut-out). Leave undefined to show initials. */
  photo?: string;
}

/** Optional shared team email, shown if the list below is ever empty. Leave '' to hide. */
export const PARTNERSHIP_TEAM_EMAIL = '';

const PHOTO = '/assets/cat-oc-pics/';
const ROLE = 'OCVP Partnership Development';

export const PARTNERSHIP_CONTACTS: PartnershipContact[] = [
  {
    id: 'gihansa-hasithmi',
    name: 'Gihansa Hasithmi',
    role: ROLE,
    email: 'gihansa.hasithmi@aiesec.net',
    phone: '+94762077417',
    photo: PHOTO + 'gihansa-ocvp-pd.webp',
  },
  {
    id: 'hari-branavan',
    name: 'Hari Branavan',
    role: ROLE,
    email: 'haribranavan@aiesec.net',
    phone: '+94719656065',
    photo: PHOTO + 'hari-ocvp-pd.webp',
  },
  {
    id: 'nethuli-gunathilaka',
    name: 'Nethuli Gunathilaka',
    role: ROLE,
    email: 'nethuli_gunathilaka@aiesec.net',
    phone: '+94701437806',
    photo: PHOTO + 'nethuli-gunathilaka-ocvp-pd.webp',
  },
  {
    id: 'chetha-atapattu',
    name: 'Chetha Atapattu',
    role: ROLE,
    email: 'chetha_atapattu@aiesec.net',
    phone: '+94704366825',
    photo: PHOTO + 'chetha-atapattu-ocvp-pd.webp',
  },
  {
    id: 'vimarshi-suraweera',
    name: 'Vimarshi Suraweera',
    role: ROLE,
    email: 'vimarshisuraweera@aiesec.net',
    phone: '+94767827385',
    photo: PHOTO + 'vimarshi-ocvp-pd.webp',
  },
];