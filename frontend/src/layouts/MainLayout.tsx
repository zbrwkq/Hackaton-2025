import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { CreateTweetButton } from '../components/CreateTweetButton';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Outlet />
      <CreateTweetButton />
    </div>
  );
}