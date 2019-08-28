import { FETCH_DRAFT } from 'graphqls';

export default {
  Mutation: {
    updateDraft: (_: any, { cover, message }: Params, { cache }: Context) => {
      const data = cache.readQuery<{ draft: Draft }>({ query: FETCH_DRAFT });

      if (!data) {
        return false;
      }

      cache.writeData({
        data: {
          draft: {
            ...data.draft,
            ...(cover && { cover } || {}),
            ...(message && { message } || {}),
          },
        },
      });

      return true;
    },
  },
};
