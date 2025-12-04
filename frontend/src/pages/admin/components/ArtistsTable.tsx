import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMusicStore } from '@/stores/useMusicStore';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Trash2, Edit2, Link2 } from 'lucide-react';
import { useState, useEffect } from 'react';
const ArtistsTable = () => {
    const { artists, isLoading, error, deleteArtist } = useMusicStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [linkArtistId, setLinkArtistId] = useState<string | null>(null);
    const [linkArtistName, setLinkArtistName] = useState<string>("");
    const [EditComp, setEditComp] = useState<any>(null);
    const [LinkComp, setLinkComp] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        if (!selectedId) { setEditComp(null); return; }
        import('./EditArtistDialog').then(m => { if (!mounted) return; setEditComp(() => m.default); });
        return () => { mounted = false; }
    }, [selectedId]);

    useEffect(() => {
        let mounted = true;
        if (!linkArtistId) { setLinkComp(null); return; }
        import('./LinkArtistDialog').then(m => { if (!mounted) return; setLinkComp(() => m.default); });
        return () => { mounted = false; }
    }, [linkArtistId]);

    if (isLoading) return <div className='py-8 text-zinc-400'>loading artists...</div>;
    if (error) return <div className='py-8 text-red-400'>{error}</div>;

    const handleLinkClick = (artistId: string, artistName: string) => {
        setLinkArtistId(artistId);
        setLinkArtistName(artistName);
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>avatar</TableHead>
                        <TableHead>name</TableHead>
                        <TableHead className='text-right'>actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {artists.map((a: any) => (
                        <TableRow key={a._id} className='hover:bg-zinc-800/50'>
                            <TableCell><img src={a.imageUrl} alt={a.name} className='size-10 rounded object-cover' /></TableCell>
                            <TableCell>
                                <div className='flex items-center gap-1'>
                                    {a.name}
                                    <VerifiedBadge verified={a.verified} size='sm' />
                                </div>
                            </TableCell>
                            <TableCell className='text-right'>
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => handleLinkClick(a._id, a.name)}
                                        className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
                                    >
                                        <Link2 className='size-4' />
                                    </Button>
                                    <Button variant='ghost' size='sm' onClick={() => setSelectedId(a._id)}>
                                        <Edit2 className='size-4' />
                                    </Button>
                                    <Button variant='ghost' size='sm' className='text-red-400 hover:text-red-300 hover:bg-red-400/10' onClick={() => deleteArtist(a._id)}>
                                        <Trash2 className='size-4' />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {selectedId && EditComp && <EditComp artistId={selectedId} open={!!selectedId} onOpenChange={(o:boolean) => !o && setSelectedId(null)} />}
            {linkArtistId && LinkComp && <LinkComp artistId={linkArtistId} artistName={linkArtistName} open={!!linkArtistId} onOpenChange={(o:boolean) => !o && setLinkArtistId(null)} />}
        </>
    );
};
export default ArtistsTable;