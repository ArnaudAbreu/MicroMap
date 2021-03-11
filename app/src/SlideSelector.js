import './SlideSelector.css';
import Select from 'react-select'

const SlideSelector = (props) => {

  const setImageByName = (name) => {
    props.resetInit();
    props.resetImage(name.label);
  }

  const format = (slide_names) => {
    let names = [];
    for (const s in slide_names) {
      names.push({value: slide_names[s], label: slide_names[s]})
    }
    return names;
  }

  return(
      <div className="selector-container">
        <Select
          className="slide-list"
          options={format(props.slides)}
          onChange={setImageByName} />
      </div>
  );

}

export {
  SlideSelector
};
