const user = {
  Admin: [
    {
      email: import.meta.env.VITE_ADMIN_1_EMAIL ?? '',
      password: import.meta.env.VITE_ADMIN_1_PASSWORD ?? ''
    },
    {
      email: import.meta.env.VITE_ADMIN_2_EMAIL ?? '',
      password: import.meta.env.VITE_ADMIN_2_PASSWORD ?? ''
    }
  ],
  Employee: [
    {
      email: import.meta.env.VITE_EMPLOYEE_1_EMAIL ?? '',
      password: import.meta.env.VITE_EMPLOYEE_1_PASSWORD ?? ''
    }
  ],
  Manager: {
    email: import.meta.env.VITE_MANAGER_EMAIL ?? '',
    password: import.meta.env.VITE_MANAGER_PASSWORD ?? ''
  },
  ManagerAdmin: {
    email: import.meta.env.VITE_MANAGER_ADMIN_EMAIL ?? '',
    password: import.meta.env.VITE_MANAGER_ADMIN_PASSWORD ?? ''
  },
  PartnerAdmin: {
    email: import.meta.env.VITE_PARTNER_ADMIN_EMAIL ?? '',
    password: import.meta.env.VITE_PARTNER_ADMIN_PASSWORD ?? ''
  }
};

export default user;
