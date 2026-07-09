import React, { useState, useEffect } from 'react';
import { COMMON_REQUEST } from '../../utils/useCommonAPI';
import { getLocalStorage, setLocalStorage } from '../../utils/useLocalStorage';

const request = new COMMON_REQUEST();

const UserInfoMaskMode = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState([])
    const [userClientData, setUserClientData] = useState(() => {
        return getLocalStorage('maskClientData');
    });

    const userData = getLocalStorage('maskUserData');

    useEffect(() => {
        if (!userClientData) {
            getClientData();
        }
    }, [data]);

    async function getClientData() {
        try {
            setLoading(true);
            setError('');

            const {data, success, error} = await request.getClientAndPartnerId(
                userData?.user?.email
            );

            if(!success){
                 setError(error || 'User not found');
                return;
            }

            setLocalStorage('maskClientData', data);
            setUserClientData(data);

        } catch (err) {
            console.error(err);
            setError('Something went wrong while getting client data.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className='text-red-600'>{error}</div>;
    }

    return (
        <pre>
            test {JSON.stringify(userData.user, null, 2)}
        </pre>
    );
};

export default UserInfoMaskMode;