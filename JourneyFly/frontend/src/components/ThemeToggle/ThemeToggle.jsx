import { FaMoon, FaSun } from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";

import styles from "./ThemeToggle.module.css";

const ThemeToggle = () => {

    const {

        theme,

        toggleTheme

    } = useTheme();

    return (

        <button

            className={styles.themeBtn}

            onClick={toggleTheme}

        >

            {

                theme === "light"

                ?

                <FaMoon/>

                :

                <FaSun/>

            }

        </button>

    );

};

export default ThemeToggle;