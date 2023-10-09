import { User } from '@/app/page';
import { createContext, useContext, useState } from 'react';

type MyContext = {
  users: User[];
  updateUsers: (value: User[]) => void;
};

const MainContext = createContext<MyContext>({
  users: [],
  updateUsers: () => {},
});

export const useMainContext = () => {
  const data = useContext(MainContext);
  return data;
};

const Context = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  const updateUsers = (value: User[]) => setUsers(value);

  return (
    <MainContext.Provider
      value={{
        users,
        updateUsers,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default Context;
