import { useState } from 'react'
import { BiChevronDown } from 'react-icons/bi'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from 'src/contexts/userContext'

import logo from '../../assets/logo.svg'
import logoText from '../../assets/logoText.svg'

import styles from './navbar.module.scss'


export const Navbar = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const path = useLocation().pathname
  const { user } = useUser()


  const handleLogout = () => {
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    navigate('/sign-in')
  }

  return (
    <>
      <nav className={styles.navbar}>
        <a href='/' className={styles.logo}>
          <img src={logoText} alt="logo" />
        </a>
        <div className={styles.links}>
          <div className={styles.dropdown}>
            <a className={styles.dropdownText} href='/account?tab=settings'>
              <img src={user?.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Avatar_icon_green.svg/2048px-Avatar_icon_green.svg.png'} alt="picture" className={styles.profilePicture} />
              <span className={styles.name}>{user?.username.toUpperCase()}</span>
              <BiChevronDown />
            </a>

            <div className={styles.dropdownContent}>
              <button onClick={() => navigate({ pathname: '/account', search: '?tab=settings' })}>Settings</button>
              <hr />
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
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
            <button onClick={() => navigate('/dashboard')} className={path.includes('dashboard') ? styles.activeLink : ''}>Dashboard</button>
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
