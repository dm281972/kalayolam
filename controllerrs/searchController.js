module.exports = function searchOptions(req) {
    let searchOptions = {};
    const searchTerm = req.query.search;
  
    if (searchTerm != null && searchTerm !== '') {
      searchOptions.$or = [
        { name: new RegExp(searchTerm, 'i') },
        { admNo: new RegExp(searchTerm, 'i') }
      ];
      return searchOptions , searchTerm 
    } 
}
