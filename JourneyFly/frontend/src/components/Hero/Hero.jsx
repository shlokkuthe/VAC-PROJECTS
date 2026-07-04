import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import styles from "./Hero.module.css";

const Hero = () => {
    return (
        <section className={styles.hero}>

            <div className={styles.overlay}></div>

            <div className={styles.content}>

                <motion.h1

                    initial={{opacity:0,y:-40}}

                    animate={{opacity:1,y:0}}

                    transition={{duration:.8}}

                >

                    Plan Every Journey

                    <br/>

                    Like a Pro

                </motion.h1>

                <motion.p

                    initial={{opacity:0}}

                    animate={{opacity:1}}

                    transition={{delay:.5}}

                >

                    Build smart itineraries,

                    manage expenses,

                    organize timelines,

                    and travel without stress.

                </motion.p>

                <motion.div

                    className={styles.buttons}

                    initial={{opacity:0}}

                    animate={{opacity:1}}

                    transition={{delay:1}}

                >

                    <Link

                        to="/signup"

                        className={styles.primary}

                    >

                        Start Planning

                    </Link>

                    <Link

                        to="/explore"

                        className={styles.secondary}

                    >

                        Explore

                        <FaArrowRight/>

                    </Link>

                </motion.div>

            </div>

        </section>
    );
};

export default Hero;