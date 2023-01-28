export default function Answer(props) {
  let bColor;
  if (props.isSelected) {
    bColor = "#D6DBF5";
  } else {
    bColor = "#f5f7fb";
  }
  if (props.isCorrect && props.isOver) {
    bColor = "#94D7A2";
  }
  const styles = {
    backgroundColor: bColor
    // backgroundColor: props.isCorrect ? "green" : "white" - not work
  };
  return (
    <p
      onClick={() => props.select(props.id, props.idQ)}
      style={styles}
      className="ansText"
    >
      {props.answer}
    </p>
  );
}
