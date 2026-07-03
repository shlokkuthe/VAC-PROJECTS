function InputField(props) {
    return (
        <div className="input-group">

            <label>{props.label}</label>

            <input
                type={props.type}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
            />

        </div>
    );
}

export default InputField;