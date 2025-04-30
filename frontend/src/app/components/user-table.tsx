// components/UserTable.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser } from "../services/users.services";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

export function UserTable() {
    const queryClient = useQueryClient();
    const router = useRouter();

    const {
        data: users = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                >
                    <div>
                        <h3 className="font-bold">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/users/${user.id}/edit`)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => user.id && deleteMutation.mutate(user.id)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}