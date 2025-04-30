import { UserForm } from "@/app/components/user-form";

export default function CreateUserPage() {
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Criar Usuário</h1>
            <UserForm />
        </main>
    );
}