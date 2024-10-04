const getAllCrudMethods = (Model) => {
   return {
      getAll: () => {
         return Model.find();
      },
      geyById: (id) => {
         return Model.findById(id);
      },
      create: (record) => {
         return Model.create(record);
      },
      update: (id, record) => {
         return Model.findByIdAndUpdate(id,record, {new:true});
      },
      delete: (id) => {
         return Model.findByIdAndDelete(id);
      }
   };
};

module.exports = getAllCrudMethods;
