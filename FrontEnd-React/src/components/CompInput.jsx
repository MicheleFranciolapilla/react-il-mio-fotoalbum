export default  function CompInput(props)
                {
                    const   {
                                label, 
                                inputType="text", 
                                inputName, 
                                inputValue,
                                callOnChange,
                                inputPH,
                                minL,
                                maxL,
                                isTextArea=false,
                                textRows,
                                textCols,
                                allCategories,
                                tailwindClasses
                            }   = props;

                    return (
                            <div className="w-full">
                                { ((inputType !== "checkbox") && (inputType !== "select")) &&   <div>
                                                                                                    <label>{label}</label>
                                                                                                </div>
                                }

                                <div className={ ((inputType === "checkbox") || (inputType === "select")) && "flex items-center justify-between" }>
                                    { ((inputType === "checkbox") || (inputType === "select")) && <label>{label}</label> }
                                    { (inputType === "select")  ?   (
                                                                        <select 
                                                                            name={inputName} 
                                                                            value={inputValue}
                                                                            onChange={ (event) => callOnChange(event.target, inputName)}
                                                                        >
                                                                            {
                                                                                allCategories.map( oneOption => 
                                                                                    (<option 
                                                                                        key={`Cat-Option-${oneOption.id}`} 
                                                                                        value={oneOption.id}
                                                                                    >
                                                                                            {oneOption.name}
                                                                                    </option>))
                                                                            }
                                                                        </select>
                                                                    ) 
                                                                :   (
                                                                        isTextArea  ?   (
                                                                                            <textarea
                                                                                                className={tailwindClasses}
                                                                                                name={inputName}
                                                                                                rows={textRows}
                                                                                                maxLength={maxL}
                                                                                                placeholder={inputPH}
                                                                                                value={inputValue}
                                                                                                onChange={ (event) => callOnChange(event.target, inputName)}
                                                                                            >
                                                                                            </textarea> 
                                                                                        )
                                                                                    :   (
                                                                                            <input 
                                                                                                className={tailwindClasses}
                                                                                                type={inputType} 
                                                                                                name={inputName}
                                                                                                value={inputValue} 
                                                                                                onChange={ (event) => callOnChange(event.target, inputName)}
                                                                                                placeholder={inputPH || ""}
                                                                                                minLength={minL || ""}
                                                                                                maxLength={maxL || ""}
                                                                                                { ...(inputType === "checkbox" ? { checked: inputValue } : {}) }
                                                                                                { ...(inputName === 'title' ? { required: true } : {}) }                                                    
                                                                                            />
                                                                                        )
                                                                    )
                                    }
                                </div>
                            </div>
                            );
                }