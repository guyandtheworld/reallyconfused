import React from 'react'

function index({ name }) {
    const baseUrl = "https://ui-avatars.com/api"
    return (
        // <div>{userAvatar}</div>
        <div>
            <img src ={`${baseUrl}/?background=3B3A3B&name=${name.replace(" ","+")}&rounded=true&color=ffffff&size=100`} alt ="pfp" />
        </div>
    )
}

export default index