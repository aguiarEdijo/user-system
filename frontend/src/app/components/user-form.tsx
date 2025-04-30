"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser, getUserById, type User } from "../services/users.services";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Alterado para sonner

// Tipos para os dados do formulário
type CreateUserData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type UpdateUserData = {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
};

const createFormSchema = z
    .object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Digite um e-mail válido"),
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

const updateFormSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Digite um e-mail válido"),
    password: z
        .string()
        .min(6, "A senha deve ter no mínimo 6 caracteres")
        .optional()
        .or(z.literal("").transform(() => undefined)),
    confirmPassword: z
        .string()
        .optional()
        .or(z.literal("").transform(() => undefined)),
});

export function UserForm({ userId }: { userId?: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: user, isLoading } = useQuery({
        queryKey: ["users", userId],
        queryFn: () => getUserById(userId!),
        enabled: !!userId,
    });

    const formSchema = userId ? updateFormSchema : createFormSchema;

    const form = useForm<CreateUserData | UpdateUserData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                password: "",
                confirmPassword: "",
            });
        }
    }, [user, form]);

    const mutation = useMutation({
        mutationFn: async (formData: CreateUserData | UpdateUserData) => {
            const { confirmPassword, ...apiData } = formData;

            if (userId && user) {
                const payload: User = {
                    name: apiData.name,
                    email: apiData.email,
                    password: apiData.password || user.password,
                };
                return updateUser(userId, payload);
            }

            if (!userId) {
                return createUser({
                    name: apiData.name,
                    email: apiData.email,
                    password: apiData.password as string,
                });
            }

            throw new Error("Operação inválida");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success(
                userId ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!"
            );
            router.push("/");
        },
        onError: (error: Error) => {
            toast.error(
                error.message || "Ocorreu um erro ao processar sua solicitação"
            );
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Digite seu nome"
                                    {...field}
                                    className="focus-visible:ring-primary"
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Endereço de e-mail</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    {...field}
                                    className="focus-visible:ring-primary"
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                    )}
                />

                {!userId && (
                    <>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••"
                                            {...field}
                                            className="focus-visible:ring-primary"
                                            disabled={mutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-sm" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirme sua senha</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••"
                                            {...field}
                                            className="focus-visible:ring-primary"
                                            disabled={mutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-sm" />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/")}
                        disabled={mutation.isPending}
                        className="min-w-24"
                    >
                        Voltar
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-primary hover:bg-primary/90 min-w-24"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {userId ? "Atualizando..." : "Criando..."}
                            </>
                        ) : (
                            userId ? "Atualizar" : "Criar"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}