$.fn.select2.amd.define('select2/data/extended-ajax',['./ajax','./tags','../utils','module','jquery'], function(AjaxAdapter, Tags, Utils, module, $){

    function ExtendedAjaxAdapter ($element,options) {
        //we need explicitly process minimumInputLength value
        //to decide should we use AjaxAdapter or return defaultResults,
        //so it is impossible to use MinimumLength decorator here
        this.minimumInputLength = options.get('minimumInputLength');
        this.defaultResults     = options.get('defaultResults');

        ExtendedAjaxAdapter.__super__.constructor.call(this,$element,options);
    }

    Utils.Extend(ExtendedAjaxAdapter,AjaxAdapter);

    //override original query function to support default results
    var originQuery = AjaxAdapter.prototype.query;

    ExtendedAjaxAdapter.prototype.query = function (params, callback) {
        var defaultResults = (typeof this.defaultResults == 'function') ? this.defaultResults.call(this) : this.defaultResults;
        if (defaultResults && defaultResults.length && (!params.term || params.term.length < this.minimumInputLength)){
            var data = { results: defaultResults };
            var processedResults = this.processResults(data, params);
            callback(processedResults);
        }
        else {
            originQuery.call(this, params, callback);
        }
    };

    if (module.config().tags) {
        return Utils.Decorate(ExtendedAjaxAdapter, Tags);
    } else {
        return ExtendedAjaxAdapter;
    }
});