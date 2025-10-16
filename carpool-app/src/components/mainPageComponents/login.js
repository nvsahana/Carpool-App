function Login() {
    const handleSubmit = () => {
        alert('Successful Login')
    }
    return (
        <>
            <div style={{textAlign:"center"}}>
            <h1>Login Page</h1>
            <p> This is Login Page</p>
            <p> Enter your credentials to login</p>
            <form onSubmit={handleSubmit()}>
                <label>
                    Username:
                    <input type="text" name="username" />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>
                <br />
                <input type="submit" value="Login" />
            </form>
            </div>
        </>
    )
}
export default Login