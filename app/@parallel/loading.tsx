import Spinner from '#/components/UI/Spinner'

function loading() {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>

        <Spinner/>
    </div>
  )
}

export default loading