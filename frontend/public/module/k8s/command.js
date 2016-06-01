angular.module('k8s')
  .factory('k8sCommand', function k8sCommand() {
    'use strict';

    return {
      fromArgs: fromArgs,
      toArgs:   toArgs
    };

    // ---

    /**
     * @param  {String[]} args
     * @return {String}
     */
    function fromArgs(args) {
      return args.map(function (arg) {
        if (!arg) { // empty argument is still valid argument and needs to be quoted
          return '\'\'';
        }

        if (!/\s/.test(arg)) { // no whitespaces? no need to use quotes then...
          return arg;
        }

        var sqi = arg.indexOf('\'');      // possible single quote position
        var dqi = arg.indexOf('"');       // possible double quote position
        var qk  = sqi > dqi ? '"' : '\''; // whatever quote comes first, we use opposite

        return qk + arg + qk;
      }).join(' ');
    }

    /**
     * @param  {String}   cmd
     * @return {String[]}
     */
    function toArgs(cmd) {
      var parts      = cmd.split(' ');
      var args       = [];
      var quoteKind  = null;
      var quotedArgs = [];

      parts.forEach(function (part) {
        if (quotedArgs.length === 0) {
          if (part[0] === '\'' || part[0] === '"') { // first time we see single/double quote?
            quoteKind = part[0];
            return quotedArgs.push(part.slice(1)); // start building list of quoted parts
          }

          // skip empty parts (though we cannot skip empty part that is between quotes!)
          if (!part) {
            return;
          }

          return args.push(part);
        }

        // continue building list of quoted parts
        quotedArgs.push(part);

        // does this part ends with same quote-kind as when we started building quoted parts?
        if (part[part.length - 1] === quoteKind) {
          args.push(quotedArgs.join(' ').slice(0, -1)); // merge quoted parts together like if they are one single argument
          quotedArgs = []; // reset state i.e. no more quoted parts building
        }
      });

      return args;
    }
  })
;