import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react';
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react';

const BASE_PATH = '/secure-sehan-admin';

export const sidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: `${BASE_PATH}/`,
          icon: IconLayoutDashboard,
        },
        {
          title: 'Exams',
          icon: IconLockAccess,
          items: [
            {
              title: 'Create Exam',
              url: `${BASE_PATH}/exams/create`,
            },
            {
              title: 'Grade Exam',
              url: `${BASE_PATH}/exams/grade`,
            },
          ],
        },
        // {
        //   title: 'Comments',
        //   url: `${BASE_PATH}/comments`,
        //   icon: IconPackages,
        // },

        {
          title: 'Reports',
          url: `${BASE_PATH}/reports`,
          icon: IconPackages,
        },
        // {
        //   title: 'Chats',
        //   url: `${BASE_PATH}/chats`,
        //   badge: '3',
        //   icon: IconMessages,
        // },
        // {
        //   title: 'Users',
        //   url: `${BASE_PATH}/users`,
        //   icon: IconUsers,
        // },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Students',
          icon: IconLockAccess,
          url: `${BASE_PATH}/students/create`,
        },
        {
          title: 'Teachers',
          icon: IconLockAccess,
          url: `${BASE_PATH}/teachers/create`,
        },
        // {
        //   title: 'Errors',
        //   icon: IconBug,
        //   items: [
        //     {
        //       title: 'Unauthorized',
        //       url: `${BASE_PATH}/401`,
        //       icon: IconLock,
        //     },
        //     {
        //       title: 'Forbidden',
        //       url: `${BASE_PATH}/403`,
        //       icon: IconUserOff,
        //     },
        //     {
        //       title: 'Not Found',
        //       url: `${BASE_PATH}/404`,
        //       icon: IconError404,
        //     },
        //     {
        //       title: 'Internal Server Error',
        //       url: `${BASE_PATH}/500`,
        //       icon: IconServerOff,
        //     },
        //     {
        //       title: 'Maintenance Error',
        //       url: `${BASE_PATH}/503`,
        //       icon: IconBarrierBlock,
        //     },
        //   ],
        // },
      ],
    },
    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Settings',
    //       icon: IconSettings,
    //       items: [
    //         {
    //           title: 'Profile',
    //           url: `${BASE_PATH}/settings`,
    //           icon: IconUserCog,
    //         },
    //         {
    //           title: 'Account',
    //           url: `${BASE_PATH}/settings/account`,
    //           icon: IconTool,
    //         },
    //         {
    //           title: 'Appearance',
    //           url: `${BASE_PATH}/settings/appearance`,
    //           icon: IconPalette,
    //         },
    //         {
    //           title: 'Notifications',
    //           url: `${BASE_PATH}/settings/notifications`,
    //           icon: IconNotification,
    //         },
    //         {
    //           title: 'Display',
    //           url: `${BASE_PATH}/settings/display`,
    //           icon: IconBrowserCheck,
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Help Center',
    //       url: `${BASE_PATH}/help-center`,
    //       icon: IconHelp,
    //     },
    //   ],
    // },
  ],
};
