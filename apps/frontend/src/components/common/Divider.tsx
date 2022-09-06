import { css } from "@emotion/css"

const dividerStyles = css`
    width: 100%;
    height: 5px;
    background: #E6F1F8;
    border-radius: 4px;
    margin-top: 2rem;
    margin-bottom: 2rem;
`

const Divider = () => <div className={dividerStyles}></div>
    
export default Divider