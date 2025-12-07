import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';

const ProfileView = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80");

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Profile</h2>
                <p className="text-muted-foreground">Introduce yourself</p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-6">
                    <div
                        className="relative w-24 h-24 rounded-full bg-muted overflow-hidden group cursor-pointer"
                        onClick={handleImageClick}
                    >
                        <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <Button variant="outline" className="rounded-full" onClick={handleImageClick}>
                        Upload new image
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <p className="text-sm text-muted-foreground">
                            The instance name will be displayed in addition to the Clone Name when shown on the profile
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Input defaultValue="Mitesh" />
                            <Input defaultValue="Khatri" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Clone Handle</Label>
                        <p className="text-sm text-muted-foreground">
                            This is your unique URL. Ideally, this should match your name and/or your handle on another site like X/Instagram.
                        </p>
                        <div className="flex rounded-md border bg-muted/50">
                            <div className="px-3 py-2 text-sm text-muted-foreground border-r bg-muted">
                                www.delphi.ai/
                            </div>
                            <input
                                className="flex-1 px-3 py-2 bg-transparent text-sm outline-none"
                                defaultValue="mitesh-khatri"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
