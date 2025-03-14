import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

const RouteWrapper = ({ component: Component, layout: Layout }) => {
    const [loading, setLoading] = useState(true);
    const params = useParams();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [params]);

    if (loading) {
        // logic loading
        return <div></div>;
    }

    return Layout ? (
        <Layout>
            <Component />
        </Layout>
    ) : (
        <Component />
    );
};

export default RouteWrapper;
