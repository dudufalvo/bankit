import styles from './account.module.scss'

import Settings from 'components/Settings'
import Tabs from 'components/Tab'

const Account = () => {
  return (
    <>
      <div className={styles.accountOptions}>
        <div className={styles.accountOptionsContent}>
          <span>Account</span>
        </div>
        <Tabs
          tabs={[
            { title: 'Settings', children: <Settings /> },
          ]} />
      </div>
    </>
  )
}

export default Account
