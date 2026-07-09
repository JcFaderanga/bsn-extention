import {Footer, Header} from '../UI'

const MainWrapper = ({className = '' ,children}) => {
  return (
    <div className={`${className} w-lg h-125`}>
        <Header/>
        {children}
        <Footer/>
    </div>
  )
}

export default MainWrapper
