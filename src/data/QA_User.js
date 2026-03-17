const defaultPassword = 'Working@@123';
const QA_User = {
  Admin: [
    {
      email: import.meta.env.VITE_ADMIN_1_EMAIL ?? '',
      password: defaultPassword
    },
  
  ],
  PartnerAdmin: [
    {
      email: import.meta.env.VITE_PARTNER_ADMIN_EMAIL ?? '',
      password: defaultPassword
    }
  ],
  ManagerAdmin: [
    {
      email: import.meta.env.VITE_MANAGER_ADMIN_EMAIL ?? '',
      password: defaultPassword
    }
  ],
  Manager: [
    {
      email: import.meta.env.VITE_MANAGER_EMAIL ?? '',
      password: defaultPassword
    }
  ],
  Employee: [
    {
      email: import.meta.env.VITE_EMPLOYEE_1_EMAIL ?? '',
      password: defaultPassword
    }
  ],
};

export default QA_User;
