import { UserForm } from "@/app/components/user-form";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const userId = params.id;
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Editar Usuário</h1>
            <UserForm userId={userId} />
        </main>
    );
}