import { motion } from 'framer-motion'
import { FiAward, FiUsers, FiStar } from 'react-icons/fi'
import { staggerContainer, fadeInUp, slideInRight, slideInLeft, pageTransition } from '../utils/animations'
import './About.css'

export default function About() {
  return (
    <motion.div 
      className="about-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="about-hero">
        <motion.div 
          className="container"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h1 variants={fadeInUp}>Our Story</motion.h1>
          <motion.p variants={fadeInUp}>
            A brilliant legacy of exquisite flavors, warm hospitality, and unforgettable family dining experiences.
          </motion.p>
        </motion.div>
      </div>

      <div className="about-content-section">
        <motion.div 
          className="about-split"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="about-text" variants={slideInLeft}>
            <h2>The Everest Experience</h2>
            <p>
              Hotel Everest Family Restaurant is a premiere fine-dining destination located gracefully on MG Road in Vijayapura. We are deeply renowned for our generous hospitality, rich textures, and comforting authentic Indian flavors that soothe the soul.
            </p>
            <p>
              Our dining room is carefully curated to combine an elegant, luxury interior with a remarkably relaxing atmosphere. It is meticulously designed for everything from intimate romantic dates and important celebrations to casual unforgettable get-togethers with family and friends.
            </p>
          </motion.div>
          <motion.div className="about-stats" variants={slideInRight}>
            <div className="stat-card">
              <div className="stat-number">
                <FiAward size={40} />
              </div>
              <div className="stat-label">20+ Years Legacy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                <FiUsers size={40} />
              </div>
              <div className="stat-label">Loved by Thousands</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                <FiStar size={40} />
              </div>
              <div className="stat-label">5-Star Cuisine</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="about-split"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="chef-card" variants={slideInLeft}>
            <h3>Chef&apos;s Masterclass</h3>
            <ul>
              <li>Trained in prestigious award-winning kitchens across the country</li>
              <li>Master of Awadhi, Hyderabadi, and authentic North Indian cuisine</li>
              <li>A personal passion for creating seasonal, spice-forward tasting menus</li>
            </ul>
          </motion.div>
          <motion.div className="about-text" variants={slideInRight}>
            <h2>Meet Our Head Chef</h2>
            <p>
              Our extraordinary kitchen is led by Executive Chef Arjun Rao, who brings over 15 years of exceptional culinary expertise from highly renowned luxury kitchens across Hyderabad, Bengaluru, and Mumbai. 
            </p>
            <p>
              Masterfully trained in both traditional heritage recipes and contemporary avant-garde cooking, Chef Arjun elevates classic flavors with spectacular modern presentation. His philosophy is profound yet simple: deeply respect the absolute finest ingredients, cook with utmost patience, and let the magnificent spices tell their story.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
