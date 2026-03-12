import { FiAward, FiUsers, FiStar } from 'react-icons/fi'
import './Home.css'

export default function About() {
  return (
    <div className="about-page">
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h1 className="section-title" style={{ textAlign: 'left' }}>
                About Hotel Everest Family Restaurant
              </h1>
              <p>
                Hotel Everest Family Restaurant is a popular family dining spot on MG Road in
                Vijayapura, known for generous portions and comforting Indian flavors.
              </p>
              <p>
                The dining area combines simple, welcoming decor with a relaxed atmosphere that
                makes it ideal for everyday meals, celebrations, and get-togethers with friends and
                family.
              </p>
            </div>
            <div className="about-stats">
              <div className="stat-card card">
                <div className="stat-number">
                  <FiAward size={32} />
                </div>
                <div className="stat-label">20+ Years of Hospitality</div>
              </div>
              <div className="stat-card card">
                <div className="stat-number">
                  <FiUsers size={32} />
                </div>
                <div className="stat-label">Loved by Locals & Travelers</div>
              </div>
              <div className="stat-card card">
                <div className="stat-number">
                  <FiStar size={32} />
                </div>
                <div className="stat-label">Top-Rated Indian Cuisine</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                Meet Our Head Chef
              </h2>
              <p>
                Our kitchen is led by Chef Arjun Rao, who brings over 15 years of experience from
                renowned kitchens across Hyderabad, Bengaluru, and Mumbai. Trained in both
                traditional and contemporary Indian cooking, Chef Arjun is known for elevating
                classic flavors with modern presentation.
              </p>
              <p>
                His signature dishes include the Dum Biryani, Smoked Tandoori Platter, and
                Saffron-infused Phirni. Chef Arjun&apos;s philosophy is simple: respect the
                ingredients, cook with patience, and let the spices tell their story.
              </p>
            </div>
            <div className="card" style={{ alignSelf: 'center' }}>
              <h3>Chef&apos;s Highlights</h3>
              <ul>
                <li>Worked in award-winning Indian restaurants across major cities</li>
                <li>Specializes in Hyderabadi, Awadhi, and North Indian cuisines</li>
                <li>Passionate about seasonal menus and regional specialties</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
