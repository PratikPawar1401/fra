import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto scrollbar-hide">{children}</main>
    </div>
  );
};

export default Layout;