import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CollectionPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Ma Collection</h1>
      
      <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
        <p className="text-slate-400 mb-4">Votre collection est vide pour le moment</p>
        <p className="text-slate-500 text-sm">
          Explorez les Pokémon et ajoutez des cartes à votre collection !
        </p>
      </div>
    </div>
  );
}