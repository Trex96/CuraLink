import connectDB from '@/lib/db/connect';
import UserModel from '@/models/user/User';

async function checkUser() {
    try {
        await connectDB();
        const user = await UserModel.findOne({ email: 'test.patient2@example.com' });
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('User Role:', user.role);
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
    process.exit(0);
}

checkUser();
