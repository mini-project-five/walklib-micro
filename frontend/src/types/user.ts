type User = {
    id?: string;
    email: string;
    userPassword: string;
    userName: string;
    isKtCustomer: boolean;
    role: 'reader' | 'admin';
};

export default User;