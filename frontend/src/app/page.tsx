
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserTable } from "./components/user-table";

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button asChild>
          <Link href="/users/create">Novo Usuário</Link>
        </Button>
      </div>
      <UserTable />
    </main>
  );
}