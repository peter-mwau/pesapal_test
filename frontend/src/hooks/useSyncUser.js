import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { api } from '../services/api';

export const useSyncUser = () => {
    const { isSignedIn, isLoaded: authLoaded, getToken } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();

    useEffect(() => {
        const syncUser = async () => {
            const loaded = authLoaded && userLoaded;
            console.log('🔄 useSyncUser check:', { authLoaded, userLoaded, isSignedIn, hasUser: !!user });

            if (!loaded) return;
            if (!isSignedIn) return;
            if (!user) {
                console.warn('⚠️ Clerk user is missing even though signed in.');
                return;
            }

            try {
                const token = await getToken();
                if (!token) {
                    console.error('❌ No token returned');
                    return;
                }

                const userData = {
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    profileImage: user.imageUrl || '',
                    phone: user.phoneNumbers?.[0]?.phoneNumber || '',
                };

                console.log('📤 Syncing user data:', userData);

                const response = await api.updateUserProfile(token, userData);
                console.log('✅ User synced successfully:', response);
            } catch (error) {
                console.error('❌ Error syncing user to database:', error);
            }
        };

        syncUser();
    }, [authLoaded, userLoaded, isSignedIn, user, getToken]);
};
