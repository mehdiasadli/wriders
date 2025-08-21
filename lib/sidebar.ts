import { BookOpenIcon, HomeIcon } from 'lucide-react';

export const sidebarLinks = [
  {
    href: '/',
    label: 'Home',
    description: 'In home page, you can find latest updates about chapters, books, series, characters, wiki pages etc.',
    Icon: HomeIcon,
    match: /^\/$/,
  },
  {
    href: '/books',
    label: 'Books',
    description: 'In books page, you can find all series and their books.',
    Icon: BookOpenIcon,
    match: /^\/books$/,
  },
];
