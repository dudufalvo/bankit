import styles from './navbar.module.scss'
import { useUser } from 'src/contexts/userContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logo from '../../assets/logo.svg'
import logoText from '../../assets/logoText.svg'
import Button from 'components/Button'

export const NavbarInfo = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const path = useLocation().pathname
  const { user } = useUser()

  return (
    <>
      <nav className={styles.navbar}>
        <a href='/' className={styles.logo}>
          <img src={logoText} alt="logo" />
        </a>
        <div className={styles.links}>
          <Button children={<span>Go to Application</span>} handle={() => {navigate('/')}}/>
        </div >
      </nav >
      <nav className={`${styles.navbarMobile} ${active && styles.navbarMobileActive}`}>
        <div className={styles.navbarTop}>
          <a href='/' className={styles.logo}>
            {/* <img src={active ? logoTextWhite : logoText} alt="logo" /> */}
          </a>
          <img
            src={logo}
            alt="burger"
            className={styles.burger}
            onClick={() => setActive(!active)}
          />
        </div>
        {
          active &&
          <div className={styles.burgerMenu}>
            <button onClick={() => navigate('/reservations')} className={path.includes('reservations') ? styles.activeLink : ''}>Reservations</button>
            <button onClick={() => navigate('/notifications')} className={path.includes('notifications') ? styles.activeLink : ''}>Notifications</button>
            <button onClick={() => navigate({ pathname: '/account', search: '?tab=settings' })} className={styles.profile}>
              <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Avatar_icon_green.svg/2048px-Avatar_icon_green.svg.png' alt="picture" className={styles.profilePicture} />
              <span className={styles.name}>{user?.first_name.toUpperCase()}</span>
            </button>
          </div>
        }
      </nav>
    </>
  )
}
