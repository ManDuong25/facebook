import classNames from 'classnames/bind';
import styles from './DefaultLayout.module.scss';
import Header from "../../components/Header/Header.jsx";

const cx = classNames.bind(styles);

const DefaultLayout = ({ children }) => {
  return (
    <div className={cx('wrapper')}>
      <Header />
      <div className={cx('content')}>
        {children}
      </div>
    </div>
  );
};

export default DefaultLayout;
