import Container from '@components/Container';

import styles from './Footer.module.scss';

const Footer = ({ ...rest }) => {
  return (
    <footer className={styles.footer} {...rest}>
      <Container className={`${styles.footerContainer} ${styles.footerLegal}`}>
        <p>
          &copy; <a href="https://github.com/mohitmakda/RouteWise.git">Routewise</a>, {new Date().getFullYear()}
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
