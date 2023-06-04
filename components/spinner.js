import styles from "./spinner.module.css";

export default function Spinner(props) {
  const { loading } = props;

    if (!loading) {
      return <></>;
    }

  return (
    <div style={{ position: "fixed", bottom: 0, right: 0, zIndex: 1 }}>
      <div className={styles.loader}></div>
    </div>
  );
}
