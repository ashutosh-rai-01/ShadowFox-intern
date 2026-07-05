import victoryImg from "../assets/victoryimg.png";
import goldjerseyImg from "../assets/goldjersey.png";
import nothingPhoneImg from "../assets/nothingcollabimg.png";
const news = [
  
    {
    category: "NEW RELEASE",
    title: "This is the Nothing Phone 4b RCB Edition, launching in India on July 7",
    desc: "Get ready to experience the future of smartphones with the Nothing Phone 4b RCB Edition, designed exclusively for RCB fans.",
    date: "June 12, 2026",
    image: nothingPhoneImg,
    },
  {
    category: "MATCH HIGHLIGHTS",
    title: "King Kohli Reigns Supreme with Match-Winning Century at Chinnaswamy",
    desc: "Virat Kohli's masterclass 108* off 54 balls guides RCB to a sensational victory against rivals. Relive the highlights, sixes, and fan roars.",
    date: "June 18, 2026",
    image: victoryImg,
  },
  {
    category: "Fan GEAR",
    title: "RCB Unveils Exclusive Metallic Gold Series Jersey for Fans",
    desc: "Co-designed with elite sportswear experts, the new jersey features high-performance mesh, glowing gold patterns, and iconic emblem carvings.",
    date: "June 15, 2026",
    image: goldjerseyImg,
  },


];

function NewsCard() {
  return (
    <section className="news">
      <h2 className="section-title">
        LATEST <span>NEWS</span>
      </h2>

      <div className="news-grid">
        {news.map((item, index) => (
          <div className="news-card" key={index}>
            <div className="news-img-wrapper">
              <span className="news-tag">{item.category}</span>
              <img src={item.image} alt={item.title} />
            </div>

            <div className="news-card-content">
              <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: 700 }}>
                {item.date}
              </span>
              <h3 style={{ marginTop: "5px" }}>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NewsCard;