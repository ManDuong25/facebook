import classNames from 'classnames/bind';
import styles from './DefaultLayout.module.scss';

const cx = classNames.bind(styles);
const DefaultLayout = ({ children }) => {
    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('content')}>{children}</div>
            </div>
        </>
    );
};

export default DefaultLayout;
