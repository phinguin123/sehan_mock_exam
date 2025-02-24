import { Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Layouts/app-sidebar';
import SkipToMain from '@/components/Layouts/skip-to-main';
import { Header } from '@/components/Layouts/header';
import { TopNav } from '@/components/Layouts/top-nav';

const topNav = [
  {
    title: 'Dashboard',
    href: 'dashboard',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Create',
    href: 'exams/create',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Grade',
    href: 'exams/grade',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Comment',
    href: 'comments',
    isActive: false,
    disabled: true,
  },
];

const AdminLayout = () => {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false';

  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id="content"
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] duration-200 ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
          )}
        >
          <Header>
            <TopNav links={topNav} />
          </Header>
          <Outlet />
        </div>
      </SidebarProvider>
    </>
  );
};

export default AdminLayout;
