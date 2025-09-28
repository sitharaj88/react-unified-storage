import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>
            One unified, secure, and modern storage solution for React applications
          </p>
          <div className={styles.heroBadges}>
            <span className={styles.badge}>🔒 End-to-End Encryption</span>
            <span className={styles.badge}>⚡ TypeScript First</span>
            <span className={styles.badge}>🔄 Cross-Tab Sync</span>
            <span className={styles.badge}>📦 Zero Dependencies</span>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>4</div>
              <div className={styles.statLabel}>Storage Drivers</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Type Safe</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>SSR</div>
              <div className={styles.statLabel}>Compatible</div>
            </div>
          </div>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/getting-started">
              🚀 Get Started - 5min
            </Link>
            <Link
              className="button button--primary button--lg"
              to="/docs/quick-start">
              📖 Quick Start Guide
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - One unified, secure, and modern storage solution for React`}
      description="React Unified Storage provides a comprehensive, type-safe storage library with encryption, compression, cross-tab sync, and multiple storage drivers for React applications.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
