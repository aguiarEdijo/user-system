// src/services/users.service.ts

import { api } from "../lib/api";


export type User = {
    id?: string;
    name: string;
    email: string;
    password: string;
};

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get("/users");
    return response.data;
};

export const createUser = async (user: Omit<User, "id">): Promise<User> => {
    const response = await api.post("/users", user);
    return response.data;
};

export const updateUser = async (
    id: string,
    userData: Omit<User, 'id'>
): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};

export const getUserById = async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};