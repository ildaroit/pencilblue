this.init = function(request, output)
{
    var instance = this;
 
    getSession(request, function(session)
    {
        var get = getQueryParameters(request);
        var post = getPostParameters(request.headers['post']);
        var adminAttempt = (get['admin_attempt']) ? true : false;
        
        var whirlpool = require('crypto').createHash('whirlpool');
        whirlpool.update(post.password);
        var hashedPassword = whirlpool.digest('hex');
        
        getDBObjectsWithValues({object_type: 'user', username: post['username'], password: hashedPassword}, function(data)
        {
            if(data.length == 0)
            {
                instance.loginError(request, session, adminAttempt, output);
                return;
            }
            
            if(adminAttempt && data[0].admin == 0)
            {
                instance.loginError(request, session, adminAttempt, output);
                return;
            }
            
            delete data[0].password;
            session.user = data[0];
            editSession(request, session, [], function(data)
            {
                if(adminAttempt)
                {
                    output({redirect: SITE_ROOT + '/admin'});
                }
                else
                {
                    output({redirect: SITE_ROOT + '/account'});
                }
            });
        });
    });
}

this.loginError = function(request, session, adminAttempt, output)
{
    session.error = '^loc_INVALID_LOGIN^';
    editSession(request, session, [], function(data)
    {
        if(adminAttempt)
        {
            output({redirect: SITE_ROOT + '/admin/login'});
            return;
        }
        
        output({redirect: SITE_ROOT + '/login'});
    });
}
