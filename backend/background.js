// learning events loop in the back ground.
    //

function refresh()
{
    const expiresAt = 5000
    const timeout = 5000
    if(timeout > 0)
    {
        setTimeout(async() => {
            console.log('next refresh will be called');
            refresh();
        }, timeout);
    }
}
refresh();
